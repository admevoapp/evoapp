ALTER TABLE products 
ADD COLUMN IF NOT EXISTS badge text,
ADD COLUMN IF NOT EXISTS shipping_info text DEFAULT 'Frete Grátis para compras acima de R$ 299',
ADD COLUMN IF NOT EXISTS warranty_info text DEFAULT 'Garantia EVO - 30 dias para troca';
