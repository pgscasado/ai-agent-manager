import os
import sys
model_name = sys.argv[1]
os.environ['TORCH_HOME'] = os.getcwd().split('/')
from sentence_transformers import SentenceTransformer
model = SentenceTransformer(model_name)
