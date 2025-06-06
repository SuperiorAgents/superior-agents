from typing import Any, List, Dict


class Message:
	"""
	Represents a single message in a conversation between different roles.

	This class encapsulates a message with its role (e.g., 'system', 'user', 'assistant'),
	content, and optional metadata. It provides methods to convert between native
	dictionary format and Message objects.

	Attributes:
	    role (str): The role of the message sender (e.g., 'system', 'user', 'assistant')
	    content (str): The text content of the message
	    metadata (Dict[str, Any]): Additional information about the message
	"""

	def __init__(self, role: str, content: str, metadata: Dict[str, Any] = {}):
		"""
		Initialize a Message with role, content, and optional metadata.

		Args:
		    role (str): The role of the message sender
		    content (str): The text content of the message
		    metadata (Dict[str, Any], optional): Additional information. Defaults to {}.
		"""
		self.role = role
		self.content = content
		self.metadata: Dict[str, Any] = metadata

	def as_native(self) -> Dict[str, str]:
		"""
		Convert the Message to a native dictionary format.

		Returns:
		    Dict[str, str]: Dictionary with 'role' and 'content' keys
		"""
		return {"role": self.role, "content": self.content}

	@staticmethod
	def from_native(native: Dict[str, Any]) -> "Message":
		"""
		Create a Message object from a native dictionary format.

		Args:
		    native (Dict[str, Any]): Dictionary containing at least 'role' and 'content' keys

		Returns:
		    Message: A new Message object

		Raises:
		    AssertionError: If 'role' or 'content' keys are missing
		"""
		assert "role" in native
		assert "content" in native

		return Message(
			role=native["role"],
			content=native["content"],
			metadata=native.get("metadata", {}),
		)

	def __repr__(self) -> str:
		"""
		Create a string representation of the Message.

		Returns:
		    str: A formatted string showing the message's role, content preview, and metadata
		"""
		return (
			"Message("
			f"\n\trole={self.role}, "
			f"\n\tcontent={self.content[:10]}..."
			f"\n\tmetadata={self.metadata}"
			"\n)"
		)


# Example :
# convo = [
#   {"role": "system": "content": "..."},
#   {"role": "user": "content": "..."},
#   {"role": "assistant": "content": "..."},
#   {"role": "user": "content": "..."},
#   {"role": "assistant": "content": "..."},
# ]


class ChatHistory:
	"""
	Represents a conversation history as a sequence of messages.

	This class manages a list of Message objects and provides methods to manipulate
	and access the conversation history. It supports operations like appending messages,
	combining histories, and converting between native format and ChatHistory objects.
	"""

	def __init__(self, messages: List[Message] | Message = []):
		"""
		Initialize a ChatHistory with a list of messages or a single message.

		Args:
		    messages (List[Message] | Message, optional): Initial messages. Defaults to [].
		"""
		self.messages: List[Message] = (
			messages if isinstance(messages, list) else [messages]
		)

	def __len__(self) -> int:
		"""
		Get the number of messages in the history.

		Returns:
		    int: The number of messages
		"""
		return len(self.messages)

	def __add__(self, other: "ChatHistory") -> "ChatHistory":
		"""
		Combine two ChatHistory objects.

		Args:
		    other (ChatHistory): Another ChatHistory to append

		Returns:
		    ChatHistory: A new ChatHistory containing messages from both histories
		"""
		new_history = ChatHistory()
		new_history.messages = self.messages.copy() + other.messages.copy()

		return new_history

	def append(self, new_message: Message) -> "ChatHistory":
		"""
		Create a new ChatHistory with an additional message.

		Args:
		    new_message (Message): The message to append

		Returns:
		    ChatHistory: A new ChatHistory with the appended message
		"""
		new_history = ChatHistory()
		new_history.messages = self.messages.copy() + [new_message]
		return new_history

	def as_native(self) -> List[Dict[str, str]]:
		"""
		Convert the ChatHistory to a list of native dictionaries.

		Returns:
		    List[Dict[str, str]]: List of message dictionaries
		"""
		return [message.as_native() for message in self.messages]

	def get_latest_response(self) -> str:
		"""
		Get the content of the most recent assistant message.

		Returns:
		    str: The content of the latest assistant message, or empty string if none exists
		"""
		assistant_messages = [
			message for message in self.messages if message.role == "assistant"
		]

		if (
			not assistant_messages
		):  # Only return empty string if there are no assistant messages
			return ""
		return assistant_messages[-1].content

	def get_latest_instruction(self) -> str:
		"""
		Get the content of the most recent user message.

		Returns:
		    str: The content of the latest user message, or empty string if none exists
		"""
		user_messages = [message for message in self.messages if message.role == "user"]

		if (
			not user_messages
		):  # Only return empty string if there are no assistant messages
			return ""

		return user_messages[-1].content

	@staticmethod
	def from_native(native: List[Dict[str, str]]) -> "ChatHistory":
		"""
		Create a ChatHistory object from a list of native dictionaries.

		Args:
		    native (List[Dict[str, str]]): List of message dictionaries

		Returns:
		    ChatHistory: A new ChatHistory object
		"""
		return ChatHistory(
			messages=[Message.from_native(message) for message in native]
		)

	def __repr__(self) -> str:
		"""
		Create a string representation of the ChatHistory.

		Returns:
		    str: A formatted string showing all messages in the history
		"""
		messages_repr = "\n".join([message.__repr__() for message in self.messages])
		return f"PList(\n\tmessages=[\n\t\t{messages_repr}\n\t\t]\n)"

	def modify_message_at_index(
		self, index: int, new_message: Message
	) -> "ChatHistory":
		"""
		Replace a message at a specific index in the history.

		Args:
		    index (int): The index of the message to replace
		    new_message (Message): The new message

		Returns:
		    ChatHistory: The modified ChatHistory (self)
		"""
		self.messages[index] = new_message

		return self

	def modify_message_metadata_at_index(
		self, index: int, new_metadata: Dict[str, str]
	) -> "ChatHistory":
		"""
		Update the metadata of a message at a specific index.

		Args:
		    index (int): The index of the message to modify
		    new_metadata (Dict[str, str]): The new metadata

		Returns:
		    ChatHistory: The modified ChatHistory (self)
		"""
		self.messages[index].metadata = new_metadata

		return self

	def get_x_metadata(self, x: str) -> List[str]:
		"""
		Extract a specific metadata field from all messages.

		Args:
		    x (str): The metadata key to extract

		Returns:
		    List[str]: List of values for the specified metadata key from all messages
		"""
		return [message.metadata[x] for message in self.messages]
