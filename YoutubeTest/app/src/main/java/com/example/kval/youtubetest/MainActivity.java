package com.example.kval.youtubetest;

import android.os.Bundle;

import org.xwalk.core.XWalkActivity;
import org.xwalk.core.XWalkPreferences;
import org.xwalk.core.XWalkView;


public class MainActivity extends XWalkActivity {
    private XWalkView xWalkView;

    @Override
    protected void onXWalkReady() {
        XWalkPreferences.setValue(XWalkPreferences.REMOTE_DEBUGGING, true);
        xWalkView.load("https://www.youtube.com/", null);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        xWalkView = (XWalkView) findViewById(R.id.xwalkview);
    }

    @Override
    protected void onResume() {
        super.onResume();
        if(xWalkView != null && isXWalkReady()){
            xWalkView.onShow();
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if(xWalkView != null && isXWalkReady()){
            xWalkView.onHide();
        }
    }
}
