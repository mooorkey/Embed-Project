#include <WiFi.h>
#include <PubSubClient.h>
#include "mqtt_secrets.h"
#include <HTTPClient.h>
#include "HX711.h"
#include "MAX30100_PulseOximeter.h"

/* max30100 on d22 and d23 */
PulseOximeter pox;

/* connection info */
const char* ssid = "SAWAT";
const char* password = "0818111946";
const char* server = "mqtt3.thingspeak.com";
const char* channelID = "2104323";
const char* HRchannelID = "2106683";
const char* mqttUserName = SECRET_MQTT_USERNAME;
const char* mqttPass = SECRET_MQTT_PASSWORD;
const char* clientID = SECRET_MQTT_CLIENT_ID;
WiFiClient client;
PubSubClient mqtt(client);

/* HX711 Info */
#define zero_factor 8165550
#define HX711_DOUT 26
#define HX711_SCK 27
#define DEC_POINT 2
float calibration_factor = 237565.00;
float offset = 0;
HX711 scale(HX711_DOUT, HX711_SCK);

void WeightTask(void* parameter) {
  while (1) {
    float data = get_units_kg() * 1000;
    if (data < 0) data = 0;
    //Serial.println("data 1 : " + String(data));
    publishToThingSpeak(mqtt, channelID, 1, data);
    delay(5000);
  }
}

void onBeatDetected() {
  // Print the pulse and SpO2 readings when a beat is detected
  Serial.println("Beat Detected!");
  Serial.print("Heart rate:");
  float hr = pox.getHeartRate();
  Serial.print(hr);
  Serial.print("bpm / SpO2:");
  Serial.print(pox.getSpO2());
  Serial.println("%");
  if (hr) {
    publishToThingSpeak(mqtt, HRchannelID, 1, hr);
  }
}

void HeartRateTask(void* parameter) {
  while (1) {
    delay(500);
  }
}

void setup() {
  /* init serial*/
  Serial.begin(115200);
  delay(1000);

  /* init wifi*/
  WiFi.mode(WIFI_STA);  //Optional
  WiFi.begin(ssid, password);
  Serial.println("\nConnecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(100);
  }
  Serial.println("\nConnected to the WiFi network");
  Serial.print("Local ESP32 IP: ");
  Serial.println(WiFi.localIP());

  /* init mqtt*/
  mqtt.setServer(server, 1883);
  Serial.println("\nConnecting to MQTT Broker");
  while (!mqtt.connected()) {
    mqtt.connect(clientID, mqttUserName, mqttPass);
    Serial.print(".");
    delay(50);
  }
  Serial.println("MQTT Broker Connected");

  /* init hx711*/
  scale.set_scale(calibration_factor);
  scale.set_offset(zero_factor);

  /* init pox */
  if (!pox.begin()) {
    Serial.println("FAILED");
    for (;;)
      ;
  } else {
    Serial.println("SUCCESS");
  }

  pox.setOnBeatDetectedCallback(onBeatDetected);

  /* create task for reading weight */
  xTaskCreatePinnedToCore(WeightTask, "Weight Task", 2048, NULL, 1, NULL, 0);
  //xTaskCreatePinnedToCore(HeartRateTask, "HeartRate Task", 2048, NULL, 2, NULL, 1);
}

void loop() {
  pox.update();
}

float get_units_kg() {
  return (scale.get_units() * 0.453592);
}

void publishToThingSpeak(PubSubClient& mqtt, const char* channelID, int fieldNumber, float data) {
  String dataString = "&field" + String(fieldNumber) + "=" + String(data);
  String topicString = "channels/" + String(channelID) + "/publish";
  mqtt.publish(topicString.c_str(), dataString.c_str());
}