import os
import sys

# Ensure src directory is in sys.path for clean internal module resolution
src_dir = os.path.dirname(os.path.abspath(__file__))
if src_dir not in sys.path:
    sys.path.insert(0, src_dir)
