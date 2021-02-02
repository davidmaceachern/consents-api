#! /bin/bash
# start-postgres-tmpfs.sh

docker run \
    --name postgrestmpfs \
    -p 5432:5432 \
    --tmpfs /var/lib/postgresql/data:rw \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=consents \
    -d \
    postgres:13.1-alpine