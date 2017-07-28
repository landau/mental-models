#!/usr/bin/env bash

if [[ $# -ne 2 ]]; then
    printf "Example: $0 http://localhost:9200 models\n"
    exit 1
fi

ES_ENDPOINT=$1
INDEX=$2

printf "Creating index ${INDEX}\n"
curl -XPUT -d @settings.json "${ES_ENDPOINT}/${INDEX}"
