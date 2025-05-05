from src.store import save_result, save_result_v4
from src.fetch import get_data_raw_v3, get_data_raw_v4
from uuid import uuid4


save_result_v4(
	notification_key="Pizza",
	strategy_id="test_reference_id_4",
	agent_id="test_agent_id",
	strategy_data="test_strategy_data",
	created_at="2023-10-01T00:00:00Z",
)

save_result_v4(
	notification_key="Burger",
	strategy_id="test_reference_id_5",
	agent_id="test_agent_id",
	strategy_data="test_strategy_data",
	created_at="2023-10-01T00:00:00Z",
)

docs = get_data_raw_v4(
	notification_query="Sphagetti",
	agent_id="test_agent_id",
	top_k=5,
)

for doc, distance in docs:
	print("#" * 20)
	print(doc)
	print("Distance:", distance)
	print("#" * 20)
