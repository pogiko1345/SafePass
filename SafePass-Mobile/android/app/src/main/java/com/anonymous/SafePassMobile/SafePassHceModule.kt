package com.anonymous.SafePassMobile

import android.content.Context
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class SafePassHceModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "SafePassHce"

  @ReactMethod
  fun setVirtualCardToken(token: String, promise: Promise) {
    val normalizedToken = token.trim().uppercase()
    reactContext
      .getSharedPreferences(SafePassHceService.PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .putString(SafePassHceService.KEY_VIRTUAL_CARD_TOKEN, normalizedToken)
      .apply()
    promise.resolve(true)
  }

  @ReactMethod
  fun getVirtualCardToken(promise: Promise) {
    val token = reactContext
      .getSharedPreferences(SafePassHceService.PREFS_NAME, Context.MODE_PRIVATE)
      .getString(SafePassHceService.KEY_VIRTUAL_CARD_TOKEN, "") ?: ""
    promise.resolve(token)
  }

  @ReactMethod
  fun clearVirtualCardToken(promise: Promise) {
    reactContext
      .getSharedPreferences(SafePassHceService.PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .remove(SafePassHceService.KEY_VIRTUAL_CARD_TOKEN)
      .apply()
    promise.resolve(true)
  }
}
