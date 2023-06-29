package com.authsignal.react;

import android.app.Activity;
import android.content.Intent;
import android.content.ActivityNotFoundException;
import android.net.Uri;
import androidx.annotation.NonNull;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import java.net.URL;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

import static android.app.Activity.RESULT_OK;

public class AuthsignalModule extends ReactContextBaseJavaModule implements ActivityEventListener {
    private final ReactApplicationContext reactContext;
    private Callback callback;

    public AuthsignalModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.reactContext.addActivityEventListener(this);
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("bundleIdentifier", reactContext.getApplicationInfo().packageName);
        return constants;
    }

    @NonNull
    @Override
    public String getName() {
        return "AuthsignalModule";
    }

    @ReactMethod
    public void launch(String url, Callback callback) {
        final Activity activity = getCurrentActivity();
        final Uri parsedUrl = Uri.parse(url);
        this.callback = callback;

        try {
            if (activity != null) {
                AuthenticationActivity.authenticateUsingBrowser(activity, parsedUrl);
            } else {
                final WritableMap error = Arguments.createMap();
                error.putString("error", "activity_not_available");
                error.putString("error_description", "Android Activity is null.");
                callback.invoke(error);
            }
        } catch (ActivityNotFoundException e){
            final WritableMap error = Arguments.createMap();
            error.putString("error", "browser_not_available");
            error.putString("error_description", "No browser app is installed");
            callback.invoke(error);
        }
    }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        Callback cb = AuthsignalModule.this.callback;

        if (cb == null) {
            return;
        }

        boolean hasResult = resultCode == RESULT_OK &&
                requestCode == AuthenticationActivity.AUTHENTICATION_REQUEST &&
                data.getData() != null;

        if (hasResult) {
            try {
                String redirectUrl = data.getData().toString();
                String query = redirectUrl.split("[?]")[1];
                String[] pairs = query.split("&");
                String token = null;
                for (String pair : pairs) {
                    int index = pair.indexOf("=");
                    String name = URLDecoder.decode(pair.substring(0, index), "UTF-8");
                    String value = URLDecoder.decode(pair.substring(index + 1), "UTF-8");
                    if (name.equals("token")) {
                        token = value;
                    }
                }
                cb.invoke(null, token);
            } catch (Exception ex) {
                final WritableMap error = Arguments.createMap();
                error.putString("error", "malformed_url");
                error.putString("error_description", "Malformed redirect url");
                cb.invoke(error);
            }

        } else {
            final WritableMap error = Arguments.createMap();
            error.putString("error", "user_cancelled");
            error.putString("error_description", "User cancelled");
            cb.invoke(error);
        }

        AuthsignalModule.this.callback = null;
    }

    @Override
    public void onNewIntent(Intent intent) {
    }
}
