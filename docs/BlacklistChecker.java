package your.package;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.ProtocolException;
import java.net.URL;
import java.net.UnknownHostException;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import org.bukkit.plugin.java.JavaPlugin;

import your.package.BlacklistedException;

public class BlacklistChecker {
    private static final int TIMEOUT = 5000;
    private static final int SERVER_ERROR = 500;
    private JavaPlugin plugin;
    private JsonParser parser = new JsonParser();

    public BlacklistChecker(JavaPlugin plugin) {
        this.plugin = plugin;
    }

    public int blacklistCheck(String userId) throws BlacklistedException {
        // TODO: use your server host
        return blacklistCheck(userId, "https://your-server.host/", true);
    }

    // HTTP POST request
    public int blacklistCheck(String userId, String apiHost, boolean useSSL) throws BlacklistedException {
        // URL
        URL url = null;
        try {
            url = new URL(apiHost);
        } catch (MalformedURLException e) {
            disableDueToError("An error occurred, disabling ... (1)");
            return -1;
        }

        // HTTPS Connection
        HttpURLConnection.setFollowRedirects(false);
        HttpURLConnection con = null;
        try {
            con = (HttpURLConnection) url.openConnection();

        } catch (IOException e) {
            disableDueToError("An error occurred, disabling ... (2)");
            return -1;
        }

        // Get user id
        String serverPort = String.valueOf(plugin.getServer().getPort());
        JsonObject jsonObject = new JsonObject();
        jsonObject.addProperty("user_id", userId);
        jsonObject.addProperty("port", serverPort);
        jsonObject.addProperty("plugin", plugin.getDescription().getFullName());
        String data = jsonObject.toString();

        // Make POST request
        try {
            con.setRequestMethod("POST");
        } catch (ProtocolException e) {
            disableDueToError("An error occurred, disabling ... (3)");
            return -1;
        }
        con.setRequestProperty("Content-Length", String.valueOf(data.length()));
        con.setRequestProperty("Content-Type", "application/json");
        con.setRequestProperty("Bukkit-Server-Port", serverPort);
        con.setConnectTimeout(TIMEOUT);
        con.setReadTimeout(TIMEOUT);
        con.setDoOutput(true);
        try (DataOutputStream wr = new DataOutputStream(con.getOutputStream())) {
            wr.write(data.getBytes("UTF-8"));
            wr.flush();
        } catch (UnknownHostException e) {
            // Handle being offline nice
            return -1;
        } catch (IOException e) {
            if (useSSL) {
                // TODO: use your server host
                return blacklistCheck(userId, "http://your-server.host/", false);
            }
            disableDueToError("An error occurred, disabling ... (4)");
            return -1;
        }

        int responseCode = 0;
        try {
            responseCode = con.getResponseCode();
        } catch (IOException e) {
            // Handle case when server instance is down gracefully.
            return responseCode;
        }

        String inputLine;
        StringBuffer response = new StringBuffer();
        if (responseCode >= SERVER_ERROR) {
            return responseCode;
        } else if (responseCode == HttpURLConnection.HTTP_OK) {
            try (BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream(), "UTF-8"))) {
                while ((inputLine = in.readLine()) != null) {
                    response.append(inputLine);
                }
            } catch (IOException e) {
                disableDueToError("An error occurred, disabling ... (5)");
                return responseCode;
            }
        } else {
            try (BufferedReader in = new BufferedReader(new InputStreamReader(con.getErrorStream(), "UTF-8"))) {
                while ((inputLine = in.readLine()) != null) {
                    response.append(inputLine);
                }
            } catch (IOException e) {
                disableDueToError("An error occurred, disabling ... (6)");
                return responseCode;
            }
        }
        boolean blacklisted = true;
        try {
            JsonElement parse = parser.parse(response.toString());
            blacklisted = parse.getAsJsonObject().get("blacklisted").getAsBoolean();
        } catch (Exception e) {
            e.printStackTrace();
            disableDueToError("An error occurred, disabling... (7)");
            return responseCode;
        }
        if (blacklisted) {
            disableDueToError("You are blacklisted...");
        }
        return responseCode;
    }

    private void disableDueToError(String... messages) throws BlacklistedException {
        for (String message : messages) {
            plugin.getLogger().severe(message);
        }
        throw new BlacklistedException();
    }
}
