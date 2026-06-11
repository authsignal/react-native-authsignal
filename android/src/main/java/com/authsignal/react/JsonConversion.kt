package com.authsignal.react

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.doubleOrNull
import kotlinx.serialization.json.longOrNull

internal object JsonConversion {
  fun toWritableMap(json: JsonObject): WritableMap {
    val map = Arguments.createMap()

    json.forEach { (key, value) ->
      when (value) {
        is JsonNull -> map.putNull(key)
        is JsonPrimitive -> putPrimitive(map, key, value)
        is JsonObject -> map.putMap(key, toWritableMap(value))
        is JsonArray -> map.putArray(key, toWritableArray(value))
      }
    }

    return map
  }

  private fun toWritableArray(json: JsonArray): WritableArray {
    val array = Arguments.createArray()

    json.forEach { value ->
      when (value) {
        is JsonNull -> array.pushNull()
        is JsonPrimitive -> pushPrimitive(array, value)
        is JsonObject -> array.pushMap(toWritableMap(value))
        is JsonArray -> array.pushArray(toWritableArray(value))
      }
    }

    return array
  }

  private fun putPrimitive(map: WritableMap, key: String, primitive: JsonPrimitive) {
    if (primitive.isString) {
      map.putString(key, primitive.content)
      return
    }

    val boolean = primitive.booleanOrNull
    if (boolean != null) {
      map.putBoolean(key, boolean)
      return
    }

    val long = primitive.longOrNull
    if (long != null) {
      map.putDouble(key, long.toDouble())
      return
    }

    val double = primitive.doubleOrNull
    if (double != null) {
      map.putDouble(key, double)
      return
    }

    map.putString(key, primitive.content)
  }

  private fun pushPrimitive(array: WritableArray, primitive: JsonPrimitive) {
    if (primitive.isString) {
      array.pushString(primitive.content)
      return
    }

    val boolean = primitive.booleanOrNull
    if (boolean != null) {
      array.pushBoolean(boolean)
      return
    }

    val long = primitive.longOrNull
    if (long != null) {
      array.pushDouble(long.toDouble())
      return
    }

    val double = primitive.doubleOrNull
    if (double != null) {
      array.pushDouble(double)
      return
    }

    array.pushString(primitive.content)
  }
}
