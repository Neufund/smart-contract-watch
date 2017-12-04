#!/bin/sh
if [ ! -f .env ];
    then cp .env.example .env;
fi

if [ ! -f .watch.yml ];
    then cp .watch.example.yml .watch.yml;
fi
