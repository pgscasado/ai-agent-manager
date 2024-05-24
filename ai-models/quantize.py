from optimum.onnxruntime import ORTQuantizer
from optimum.onnxruntime.configuration import AutoQuantizationConfig
# This assumes a model.onnx exists in path/to/model
import sys
model_name = sys.argv[1].replace('/', '_')
quantizer = ORTQuantizer.from_pretrained(f"./sentence_transformers/{model_name}/onnx")
dqconfig = AutoQuantizationConfig.avx512_vnni(is_static=False, per_channel=False)

# Quantize the model
model_quantized_path = quantizer.quantize(
    save_dir=f"./{model_name}-quantized",
    quantization_config=dqconfig,
)