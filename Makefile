AWS_ACCESS_KEY=$(shell cat .aws.key)
AWS_ACCESS_SECRET=$(shell cat .aws.secret)

deploy:
	s3cmd sync ./public/ \
		s3://www.mynamecon.com/ \
		--exclude '*.DS_Store' \
		--exclude 'example.html' \
		--access_key=$(AWS_ACCESS_KEY) \
		--secret_key=$(AWS_ACCESS_SECRET)
	s3cmd setacl s3://www.mynamecon.com/ \
		--acl-public \
		--recursive \
		--access_key=$(AWS_ACCESS_KEY) \
		--secret_key=$(AWS_ACCESS_SECRET)