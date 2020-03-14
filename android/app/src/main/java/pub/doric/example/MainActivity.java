package pub.doric.example;


import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;

import pub.doric.DoricFragment;

public class MainActivity extends AppCompatActivity {
    private final String BUNDLE_NAME = "V2EX";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        if (savedInstanceState == null) {
            String source = "assets://src/" + BUNDLE_NAME + ".js";
            getIntent().putExtra("source", scheme);
            getIntent().putExtra("alias", BUNDLE_NAME);
            this.getSupportFragmentManager().beginTransaction().add(R.id.root, new DoricFragment()).commit();
        }
    }
}
