ALTER TABLE users
ALTER id SET default gen_random_uuid();

ALTER TABLE sessions
ALTER id SET default gen_random_uuid();

ALTER TABLE organizations
ALTER id SET default gen_random_uuid();

ALTER TABLE organization_members
ALTER id SET default gen_random_uuid();

ALTER TABLE environments
ALTER id SET default gen_random_uuid();

ALTER TABLE services
ALTER id SET default gen_random_uuid();