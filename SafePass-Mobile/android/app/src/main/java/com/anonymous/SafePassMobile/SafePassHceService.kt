package com.anonymous.SafePassMobile

import android.content.Context
import android.nfc.cardemulation.HostApduService
import android.os.Bundle
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

    return concat(token.toByteArray(StandardCharsets.UTF_8), STATUS_SUCCESS)
  }

  override fun onDeactivated(reason: Int) {
    // No cleanup needed; the token remains available for the next reader tap.
  }
}
