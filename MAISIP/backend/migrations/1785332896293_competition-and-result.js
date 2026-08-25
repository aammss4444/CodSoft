exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE competition_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      achievement_id UUID NOT NULL UNIQUE REFERENCES achievements(id) ON DELETE CASCADE,
      name VARCHAR(300) NOT NULL,
      organized_by VARCHAR(200) NOT NULL,
      recognized_by VARCHAR(200),
      governing_federation VARCHAR(200),
      venue_name VARCHAR(200) NOT NULL,
      city VARCHAR(100) NOT NULL,
      district VARCHAR(100),
      state VARCHAR(100),
      country VARCHAR(100) NOT NULL,
      level VARCHAR(50) NOT NULL,
      format VARCHAR(50) NOT NULL,
      age_group VARCHAR(50) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      CONSTRAINT chk_event_dates CHECK (end_date >= start_date),
      CONSTRAINT chk_district_state_if_india CHECK (
        country <> 'India' OR (district IS NOT NULL AND state IS NOT NULL)
      )
    );

    CREATE TABLE result_performances (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      achievement_id UUID NOT NULL UNIQUE REFERENCES achievements(id) ON DELETE CASCADE,
      result_type VARCHAR(100) NOT NULL,
      final_position INT,
      total_participants INT,
      performance_value NUMERIC(12,3),
      measurement_unit VARCHAR(30),
      is_personal_best BOOLEAN NOT NULL DEFAULT false,
      previous_best NUMERIC(12,3)
    );
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP TABLE result_performances;
    DROP TABLE competition_events;
  `);
};
