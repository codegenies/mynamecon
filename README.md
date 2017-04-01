# My Name Con
This is the repository for the lambda function and website of [www.mynamecon.com](http://www.mynamecon.com). This project was created for a fun April Fool's day experience :)

## Lambda Function

The conventions are generated from a lambda function that gets called if a convention for your name has not been generated already. The data is stored in [data.json](./data/data/json) for the list of people and [cities.json](./data/cities.json) for the list of cities.

## Website

The main website is [www.mynamecon.com](http://www.mynamecon.com) hosted on S3 which each new name con gets put into the same bucket. So once you generate 'John' you can then go to [www.mynamecon.com/john.html](http://www.mynamecon.com/john.html). The website will automatically redirect you upon creation or if already created. The website files are in [public](./public).

## Deploy

### Serverless Function
You can deploy your own version by using the [serverless framework](https://serverless.com/). Once installed simply run `serverless deploy`. You will need to configure the env var for `S3_BUCKET` in your lambda (or other FaaS) function.

### Website
To deploy the website you will first need [s3cmd](https://github.com/s3tools/s3cmd) installed. Then create a `.aws.key` and `.aws.secret` files and modify the [Makefile](./Makefile) to point to your S3 bucket. Then run `make deploy` and it should sync the files in [public/*](./public/) to your bucket. You can always push the files up to any host by hand as well, it will work on any webserver.

## Notes

Running serverless locally may not support version nodejs6.10. Try modifying [serverless.yml](./serverless.yml) to an older version of node.

## Maintainers

Project maintained by [CodeGenies](http://github.com/codegenies).

![codegenies](https://avatars0.githubusercontent.com/u/26720471?v=3&s=200)