This directory should contain the original training notebook and related artifacts for the skin classifier.

Download the notebook and the TFLite model from the original repository and place them here and in `backend/model/`:

- `model/DermaSmart_Model.ipynb` — training notebook (Jupyter)
- `backend/model/tf_model.tflite` — TFLite model used at runtime (~11 MB)

You can fetch them with these commands:

```
mkdir -p backend/model model
curl -L -o backend/model/tf_model.tflite \
  https://github.com/Kranthi1205/DermaSmart/raw/main/backend/model/tf_model.tflite
curl -L -o model/DermaSmart_Model.ipynb \
  https://github.com/Kranthi1205/DermaSmart/raw/main/model/DermaSmart_Model.ipynb
```

Verify `backend/model/tf_model.tflite` is about 11 MB. If it's a few hundred bytes, the download failed.
