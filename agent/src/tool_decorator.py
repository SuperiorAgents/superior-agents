import inspect
from typing import Dict, Any, Callable, List
from functools import wraps


class ToolRegistry:
	"""Class-level tool registry with instance binding"""

	TYPE_MAP = {
		int: "integer",
		float: "number",
		str: "string",
		bool: "boolean",
		list: "array",
		dict: "object",
		type(None): "null",
	}

	def __init__(self, namespace: str):
		self.namespace = namespace
		self._tools: Dict[str, Dict] = {}
		self._funcs: Dict[str, Callable] = {}

	def __call__(self, func: Callable) -> Callable:
		"""Decorator that registers class-level methods"""
		full_name = f"{self.namespace}.{func.__name__}"
		self._tools[full_name] = self._generate_schema(func, full_name)
		self._funcs[func.__name__] = func

		@wraps(func)
		def wrapper(instance, *args, **kwargs):
			return func(instance, *args, **kwargs)

		return wrapper

	def get_all(self) -> List[Dict]:
		return list(self._tools.values())

	def execute(self, instance, name: str, *args, **kwargs):
		"""Execute method on a specific instance"""
		return self._funcs[name](instance, *args, **kwargs)

	def _generate_schema(self, func: Callable, full_name: str) -> Dict[str, Any]:
		"""Generate OpenAI-compatible function schema from a Python function"""
		sig = inspect.signature(func)
		doc = inspect.getdoc(func) or ""

		# Parse documentation
		description = doc.split("\n\n")[0] if doc else ""
		param_descriptions = self._parse_param_docs(doc)
		returns_description = self._parse_return_docs(doc)

		# Build parameters schema
		parameters = {"type": "object", "properties": {}, "required": []}

		for name, param in sig.parameters.items():
			if name == "self":
				continue  # Skip instance reference

			param_info = {
				"description": param_descriptions.get(name, ""),
				"type": self._map_type(param.annotation),
			}

			# Handle default values
			if param.default != inspect.Parameter.empty:
				param_info["default"] = param.default

			parameters["properties"][name] = param_info

			if param.default == inspect.Parameter.empty:
				parameters["required"].append(name)

		# Build return schema
		return_type = sig.return_annotation
		returns = (
			{"description": returns_description, "type": self._map_type(return_type)}
			if return_type != sig.empty
			else {}
		)

		return {
			"type": "function",
			"function": {
				"name": full_name,
				"description": description,
				"parameters": parameters,
				"returns": returns,
			},
		}

	def _parse_param_docs(self, doc: str) -> Dict[str, str]:
		"""Parse Google-style docstring parameter documentation"""
		param_docs = {}
		current_param = None

		for line in doc.split("\n"):
			line = line.strip()
			if line.startswith("Args:"):
				continue
			if ":" in line and line.split(":")[0].isidentifier():
				current_param, desc = line.split(":", 1)
				param_docs[current_param.strip()] = desc.strip()
			elif current_param:
				param_docs[current_param] += " " + line.strip()

		return param_docs

	def _parse_return_docs(self, doc: str) -> str:
		"""Parse Google-style return documentation"""
		returns = []
		in_returns = False

		for line in doc.split("\n"):
			line = line.strip()

			if line.lower().startswith("returns:"):
				in_returns = True
				returns.append(line.split(":", 1)[-1].strip())
				continue

			if in_returns:
				if line.startswith(("Args:", "Example", "Raises:")):
					break
				returns.append(line)

		return " ".join(returns).strip()

	def _map_type(self, annotation: type) -> str:
		"""Map Python type to JSON schema type string"""
		return self.TYPE_MAP.get(annotation, "string")
