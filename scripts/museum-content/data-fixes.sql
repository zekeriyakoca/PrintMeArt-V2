-- One-off catalogue fixes found while matching products to museum records (2026-10-20).
-- Run once:  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 --single-transaction -f data-fixes.sql

-- The same museum object listed twice: hide the lower-resolution copy.
--   538 / 932  Amusement on the Ice (SK-A-3286)        -> keep 932
--   567 / 960  Dutch Ships in a Calm (SK-C-1707)       -> keep 960
--   1167 / 1198 Vernet, Morning (AIC 16439)            -> keep 1198
UPDATE catalog."Products" SET "IsVisible" = false, "UpdatedAt" = now() WHERE "Id" IN (538, 567, 1167);

-- 1184 "Mountain Village Square" is a watercolour of a village square, but it is
-- recorded as Vernet's "Morning" (AIC 16439). Real source unknown: hide until fixed.
UPDATE catalog."Products" SET "IsVisible" = false, "UpdatedAt" = now() WHERE "Id" = 1184;

-- 897 "IJsgezicht bij een brouwerij" points at another Rijksmuseum painting (SK-A-1718)
-- and is not in the Rijksmuseum. Fall back to its original WikiArt source.
UPDATE catalog."Products"
SET "Metadata" = ("Metadata" - 'Museum' - 'Location') || jsonb_build_object('SourceUrl', "Metadata"->>'SourceUrl_Legacy'),
    "UpdatedAt" = now()
WHERE "Id" = 897 AND "Metadata" ? 'SourceUrl_Legacy';
DELETE FROM catalog."ProductProductAttribute"
WHERE "ProductsId" = 897
  AND "AttributesId" = (SELECT "Id" FROM catalog."ProductAttributes" WHERE "Name" = 'Rijksmuseum' AND "GroupId" = 6);

-- The literal string "null" stored as a metadata value (Painter, Museum).
UPDATE catalog."Products"
SET "Metadata" = (SELECT jsonb_object_agg(key, value) FROM jsonb_each("Metadata") WHERE value <> '"null"'::jsonb),
    "UpdatedAt" = now()
WHERE "Metadata" @? '$.* ? (@ == "null")';

-- ...and an Artist attribute literally named "null", which also shows up in the artist filter.
DELETE FROM catalog."ProductProductAttribute"
WHERE "AttributesId" IN (SELECT "Id" FROM catalog."ProductAttributes" WHERE "Name" = 'null' AND "GroupId" = 5);
DELETE FROM catalog."ProductAttributes" WHERE "Name" = 'null' AND "GroupId" = 5;

-- Museum names: the Origin attribute is the canonical name; make Metadata.Museum match it
-- ("The Art Institute of Chicago", "Rijksmuseum (Amsterdam)", "Birmingham Museum & Art Gallery", ...).
UPDATE catalog."Products" p
SET "Metadata" = p."Metadata" || jsonb_build_object('Museum', a."Name"), "UpdatedAt" = now()
FROM catalog."ProductProductAttribute" ppa
JOIN catalog."ProductAttributes" a ON a."Id" = ppa."AttributesId" AND a."GroupId" = 6
WHERE ppa."ProductsId" = p."Id" AND p."Metadata"->>'Museum' IS DISTINCT FROM a."Name";
