  #!/bin/bash
  # Run once on first deploy to bootstrap SSL certificates.
  # Uses DNS-01 challenge (required when behind DDoS-Guard/CDN).
  # After this, certs auto-renew via the certbot container.

  set -e

  DOMAIN="newsciencex.com"
  EMAIL="madridtar2k@gmail.com"
  VOLUME_CONF="newsciencex_certbot-conf"

  # Skip if cert already exists
  if docker run --rm -v "$VOLUME_CONF":/etc/letsencrypt \
      certbot/certbot certificates 2>/dev/null | grep -q "$DOMAIN"; then
    echo "==> Certificate already exists, skipping."
  else
    echo "==> Obtain SSL certificate via DNS-01 challenge"
    echo "    You will be prompted to add TXT records to Namecheap DNS."
    echo ""

    docker run -it --rm \
      -v "$VOLUME_CONF":/etc/letsencrypt \
      certbot/certbot certonly --manual \
        --preferred-challenges dns \
        --email "$EMAIL" \
        --agree-tos \
        --no-eff-email \
        -d "$DOMAIN" \
        -d "www.$DOMAIN"
  fi

  echo "==> Start full stack with HTTPS"
  docker compose up -d --build

  echo ""
  echo "Done! Site is live at https://$DOMAIN"
