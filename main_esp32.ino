#include <WiFi.h>
#include <PubSubClient.h>
#include "mqtt_secrets.h"
#include <HTTPClient.h>
#include "HX711.h"
#include "MAX30100_PulseOximeter.h"
#include <HardwareSerial.h>

/* max30100 on d22 and d23 */
#define MAX30100_ADDRESS 0x57
#define REPORTING_PERIOD_MS 1000
PulseOximeter pox;
uint32_t tsLastReport = 0;

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
    //Serial2.print(String(data));
    if (data < 0) data = 0;
    //Serial.println("data 1 : " + String(data));
    publishToThingSpeak(mqtt, channelID, 1, data);
    delay(5000);
  }
}

void SendingA(void* parameter) {
  while (1) {
    Serial2.print(String(get_units_kg() * 1000) + "," + String(pox.getHeartRate()));
    delay(2500);
  }
}

void onBeatDetected() {
  Serial.println("Beat Detected!");
  publishToThingSpeak(mqtt, HRchannelID, 1, pox.getHeartRate());
  Serial.println("Publish!");
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
    Serial.println("POX Init FAILED");
    for (;;)
      ;
  } else {
    Serial.println("POX Init SUCCESS");
  }
  pox.setIRLedCurrent(MAX30100_LED_CURR_7_6MA);
  pox.setOnBeatDetectedCallback(onBeatDetected);

  Serial2.begin(115200, SERIAL_8N1, 3, 1);
  
  /* create task for reading weight */
  xTaskCreatePinnedToCore(WeightTask, "Weight Task", 2048, NULL, 1, NULL, 0);
  xTaskCreatePinnedToCore(SendingA, "HeartRate Task", 2048, NULL, 2, NULL, 1);
}

void loop() {
  pox.update();

  if (millis() - tsLastReport > REPORTING_PERIOD_MS) {
    Serial.print("Heart rate:");
    float HR = pox.getHeartRate();
    Serial.print(HR);
    Serial.print("bpm / SpO2:");
    Serial.print(pox.getSpO2());
    Serial.print("% ");
    Serial.print("sta:");
    Serial.println(pox.getRedLedCurrentBias());
    tsLastReport = millis();
  }
  delay(100);
}

float get_units_kg() {
  return (scale.get_units() * 0.453592);
}

void publishToThingSpeak(PubSubClient& mqtt, const char* channelID, int fieldNumber, float data) {
  String dataString = "&field" + String(fieldNumber) + "=" + String(data);
  String topicString = "channels/" + String(channelID) + "/publish";
  mqtt.publish(topicString.c_str(), dataString.c_str());
}