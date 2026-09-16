import tensorflow as tf
import os

# Paths
keras_model_path = "backend/model/tf_model.keras"
tflite_model_path = "backend/model/tf_model.tflite"

print(f"🔄 Converting {keras_model_path} to TFLite...")

if not os.path.exists(keras_model_path):
    print(f"❌ Error: {keras_model_path} not found.")
    exit(1)

try:
    # 1. Load the Keras model
    model = tf.keras.models.load_model(keras_model_path)

    # 2. Convert to TFLite
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    tflite_model = converter.convert()

    # 3. Save the TFLite model
    with open(tflite_model_path, 'wb') as f:
        f.write(tflite_model)

    print(f"✅ Success! TFLite model saved at: {tflite_model_path}")
    print(f"📊 Size reduction: ~{os.path.getsize(keras_model_path)//1024}KB -> {os.path.getsize(tflite_model_path)//1024}KB")

except Exception as e:
    print(f"❌ Error during conversion: {e}")
