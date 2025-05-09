-- The 6 queries Task One - Write SQL Statements

-- Insert a new record on an account table
INSERT INTO account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');


-- Modify the Tony Stark record from "Client" to "Admin"
UPDATE account
SET account_type = 'Admin'
WHERE account_firstname = 'Tony';


-- Delete Tony Stark record from the database
DELETE FROM account
WHERE account_firstname = 'Tony';


-- Modify the "GM Hummer" record to read "a huge interior" rather than "small interiors"
UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';


-- Use an inner join to select the make and model fields from an inventory table 
-- and the classification name field from a classification table for inventory 
-- items that belong to the "Sport" category (the 2).
SELECT
    inv_make,
    inv_model,
    classification_name
FROM
    inventory
INNER JOIN classification
    ON inventory.classification_id = classification.classification_id
WHERE inventory.classification_id = 2;


-- Update all records on an inventory table to add "/vehicles" to the middle of 
-- a file path in an inv_image and inv_thumbnail columns
UPDATE
  inventory
SET
  inv_image = REPLACE(inv_image, '/images', '/images/vehicles'),
  inv_thumbnail = REPLACE(inv_thumbnail, '/images', '/images/vehicles')