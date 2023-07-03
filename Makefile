build:
	docker build -t converter-back-image .

run:
	docker run -d -p 3000:3000 --name converter-back -v uploads:/app/uploads --rm converter-back-image

stop:
	docker stop converter-back