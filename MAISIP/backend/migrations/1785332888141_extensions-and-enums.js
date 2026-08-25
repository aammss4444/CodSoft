exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    CREATE TYPE user_role AS ENUM ('athlete','institute','system_admin');
    CREATE TYPE identity_status AS ENUM ('pending','verified','rejected');
    CREATE TYPE submitter_role AS ENUM ('athlete','school','college_university','sports_academy','sports_institution','government_approved_facility');
    CREATE TYPE achievement_category AS ENUM ('medal','ranking','certificate','personal_best','sports_record','competition_result','selection','participation','award_recognition','scholarship','team_achievement','other');
    CREATE TYPE verification_status AS ENUM ('draft','submitted','under_review','verified','rejected','correction_requested');
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP TYPE verification_status;
    DROP TYPE achievement_category;
    DROP TYPE submitter_role;
    DROP TYPE identity_status;
    DROP TYPE user_role;
    DROP EXTENSION IF EXISTS pgcrypto;
  `);
};
