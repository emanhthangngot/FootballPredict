# ETL

Airflow DAG area for ingestion, feature materialization, prediction snapshots, RAG embeddings, and retraining.

Current foundation:

- `dags/architecture_foundation_sample_dag.py` models the first dependency chain:
  ingestion -> online feature materialization -> prediction snapshot.
- `docker-compose.local.yml` runs Airflow with `LocalExecutor` on port `8081`.
