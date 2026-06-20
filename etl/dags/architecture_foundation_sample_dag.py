from __future__ import annotations

from datetime import datetime

try:
    from airflow import DAG
    from airflow.operators.empty import EmptyOperator
except ImportError:
    DAG = None
    EmptyOperator = None


if DAG is not None and EmptyOperator is not None:
    with DAG(
        dag_id="architecture_foundation_sample",
        start_date=datetime(2026, 6, 20),
        schedule="@daily",
        catchup=False,
        tags=["footballpredict", "foundation"],
    ) as dag:
        ingest = EmptyOperator(task_id="ingest_fixture_and_odds")
        materialize = EmptyOperator(task_id="materialize_online_features")
        snapshot = EmptyOperator(task_id="create_prediction_snapshot")

        ingest >> materialize >> snapshot
