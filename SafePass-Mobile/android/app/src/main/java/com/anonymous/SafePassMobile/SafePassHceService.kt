package com.anonymous.SafePassMobile

import android.content.Context
import android.media.AudioManager
import android.media.ToneGenerator
import android.nfc.cardemulation.HostApduService
import android.os.Bundle
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import java.nio.charset.StandardCharsets

class SafePassHceService : HostApduService() {
  companion object {
    const val PREFS_NAME = "safepass_hce"
    const val KEY_VIRTUAL_CARD_TOKEN = "virtual_card_token"

    private val SELECT_AID_APDU = hexToBytes("00A4040009F0534146455041535300")
    private val STATUS_SUCCESS = hexToBytes("9000")
    private val STATUS_NOT_FOUND = hexToBytes("6A82")
    private val STATUS_FAILED = hexToBytes("6F00")

    private fun hexToBytes(hex: String): ByteArray {
      val cleanHex = hex.replace("\\s".toRegex(), "")
      val data = ByteArray(cleanHex.length / 2)
      for (i in data.indices) {
        val index = i * 2
        data[i] = cleanHex.substring(index, index + 2).toInt(16).toByte()
      }
      return data
    }

    private fun startsWithBytes(value: ByteArray, prefix: ByteArray): Boolean {
      if (value.size < prefix.size) return false
      for (index in prefix.indices) {
        if (value[index] != prefix[index]) return false
      }
      return true
    }

    private fun concat(left: ByteArray, right: ByteArray): ByteArray {
      val output = ByteArray(left.size + right.size)
      System.arraycopy(left, 0, output, 0, left.size)
      System.arraycopy(right, 0, output, left.size, right.size)
      return output
    }
  }

  override fun processCommandApdu(commandApdu: ByteArray?, extras: Bundle?): ByteArray {
    if (commandApdu == null || commandApdu.isEmpty()) return STATUS_FAILED

    if (!startsWithBytes(commandApdu, SELECT_AID_APDU.copyOfRange(0, SELECT_AID_APDU.size - 1))) {
      return STATUS_NOT_FOUND
    }

    val token = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .getString(KEY_VIRTUAL_CARD_TOKEN, "")
      ?.trim()
      ?.uppercase()
      .orEmpty()

    if (token.isBlank()) return STATUS_NOT_FOUND

    playTapFeedback()
    return concat(token.toByteArray(StandardCharsets.UTF_8), STATUS_SUCCESS)
  }

  private fun playTapFeedback() {
    try {
      val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        val manager = getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
        manager.defaultVibrator
      } else {
        @Suppress("DEPRECATION")
        getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
      }

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        vibrator.vibrate(VibrationEffect.createOneShot(90, VibrationEffect.DEFAULT_AMPLITUDE))
      } else {
        @Suppress("DEPRECATION")
        vibrator.vibrate(90)
      }
    } catch (_: Exception) {
      // HCE must always answer quickly even when vibration is unavailable.
    }

    try {
      val tone = ToneGenerator(AudioManager.STREAM_NOTIFICATION, 80)
      tone.startTone(ToneGenerator.TONE_PROP_BEEP, 120)
      Handler(Looper.getMainLooper()).postDelayed({ tone.release() }, 220)
    } catch (_: Exception) {
      // Some devices silence app tones; the NFC response should still succeed.
    }
  }

  override fun onDeactivated(reason: Int) {
    // No cleanup needed; the token remains available for the next reader tap.
  }
}
