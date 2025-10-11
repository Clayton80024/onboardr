-- Create courses table
CREATE TABLE courses (
    course_id SERIAL PRIMARY KEY,
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    tuition_cost_per_semester DECIMAL(10,2) NOT NULL,
    program_type TEXT NOT NULL CHECK (program_type IN ('Undergraduate', 'Graduate', 'Doctorate', 'Certificate', 'Diploma')),
    max_loan_term_months INTEGER NOT NULL CHECK (max_loan_term_months > 0),
    risk_premium_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.00 CHECK (risk_premium_multiplier >= 0.50 AND risk_premium_multiplier <= 3.00),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view active courses" ON courses 
    FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can view all courses" ON courses 
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX idx_courses_university_id ON courses(university_id);
CREATE INDEX idx_courses_program_type ON courses(program_type);
CREATE INDEX idx_courses_is_active ON courses(is_active);
CREATE INDEX idx_courses_risk_premium ON courses(risk_premium_multiplier);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_courses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION update_courses_updated_at();

-- Insert sample courses for Harvard, MIT, and Stanford
INSERT INTO courses (university_id, name, tuition_cost_per_semester, program_type, max_loan_term_months, risk_premium_multiplier) VALUES

-- Harvard University courses
((SELECT id FROM universities WHERE name = 'Harvard University'), 'Bachelor of Arts (BA)', 4500.00, 'Undergraduate', 9, 1.00),
((SELECT id FROM universities WHERE name = 'Harvard University'), 'Bachelor of Science (BS)', 4500.00, 'Undergraduate', 9, 1.00),
((SELECT id FROM universities WHERE name = 'Harvard University'), 'Master of Business Administration (MBA)', 7500.00, 'Graduate', 12, 1.15),
((SELECT id FROM universities WHERE name = 'Harvard University'), 'Master of Public Health (MPH)', 6500.00, 'Graduate', 12, 1.10),
((SELECT id FROM universities WHERE name = 'Harvard University'), 'Doctor of Philosophy (PhD)', 8500.00, 'Doctorate', 18, 1.20),
((SELECT id FROM universities WHERE name = 'Harvard University'), 'Bachelor of Fine Arts (BFA)', 4500.00, 'Undergraduate', 9, 1.25),

-- MIT courses
((SELECT id FROM universities WHERE name = 'Massachusetts Institute of Technology'), 'Bachelor of Science in Computer Science', 4800.00, 'Undergraduate', 9, 1.00),
((SELECT id FROM universities WHERE name = 'Massachusetts Institute of Technology'), 'Bachelor of Science in Engineering', 4800.00, 'Undergraduate', 9, 1.00),
((SELECT id FROM universities WHERE name = 'Massachusetts Institute of Technology'), 'Master of Science in Computer Science', 7200.00, 'Graduate', 12, 1.05),
((SELECT id FROM universities WHERE name = 'Massachusetts Institute of Technology'), 'Master of Engineering', 7200.00, 'Graduate', 12, 1.05),
((SELECT id FROM universities WHERE name = 'Massachusetts Institute of Technology'), 'PhD in Computer Science', 8800.00, 'Doctorate', 18, 1.15),
((SELECT id FROM universities WHERE name = 'Massachusetts Institute of Technology'), 'Bachelor of Science in Physics', 4800.00, 'Undergraduate', 9, 1.00),

-- Stanford University courses
((SELECT id FROM universities WHERE name = 'Stanford University'), 'Bachelor of Science in Computer Science', 4600.00, 'Undergraduate', 9, 1.00),
((SELECT id FROM universities WHERE name = 'Stanford University'), 'Bachelor of Arts in Psychology', 4600.00, 'Undergraduate', 9, 1.00),
((SELECT id FROM universities WHERE name = 'Stanford University'), 'Master of Science in Computer Science', 7000.00, 'Graduate', 12, 1.05),
((SELECT id FROM universities WHERE name = 'Stanford University'), 'Master of Business Administration (MBA)', 7800.00, 'Graduate', 12, 1.15),
((SELECT id FROM universities WHERE name = 'Stanford University'), 'PhD in Computer Science', 8600.00, 'Doctorate', 18, 1.15),
((SELECT id FROM universities WHERE name = 'Stanford University'), 'Bachelor of Fine Arts (BFA)', 4600.00, 'Undergraduate', 9, 1.25),

-- Additional courses for other universities
((SELECT id FROM universities WHERE name = 'University of California, Berkeley'), 'Bachelor of Science in Engineering', 4200.00, 'Undergraduate', 9, 1.00),
((SELECT id FROM universities WHERE name = 'University of California, Berkeley'), 'Master of Science in Data Science', 6800.00, 'Graduate', 12, 1.10),
((SELECT id FROM universities WHERE name = 'Yale University'), 'Bachelor of Arts (BA)', 4400.00, 'Undergraduate', 9, 1.00),
((SELECT id FROM universities WHERE name = 'Yale University'), 'Master of Fine Arts (MFA)', 7200.00, 'Graduate', 12, 1.30),
((SELECT id FROM universities WHERE name = 'Princeton University'), 'Bachelor of Science in Engineering', 4300.00, 'Undergraduate', 9, 1.00),
((SELECT id FROM universities WHERE name = 'Princeton University'), 'PhD in Physics', 8500.00, 'Doctorate', 18, 1.20);

-- Add comments for documentation
COMMENT ON TABLE courses IS 'Courses/programs offered by universities with tuition costs and risk assessment';
COMMENT ON COLUMN courses.course_id IS 'Primary key - unique identifier for each course';
COMMENT ON COLUMN courses.university_id IS 'Foreign key linking to universities table';
COMMENT ON COLUMN courses.name IS 'Full name of the course/program';
COMMENT ON COLUMN courses.tuition_cost_per_semester IS 'Tuition cost per semester in USD';
COMMENT ON COLUMN courses.program_type IS 'Type of program (Undergraduate, Graduate, Doctorate, etc.)';
COMMENT ON COLUMN courses.max_loan_term_months IS 'Maximum loan term in months for this specific course';
COMMENT ON COLUMN courses.risk_premium_multiplier IS 'Risk multiplier for fee calculation (1.00 = standard, >1.00 = higher risk)';
COMMENT ON COLUMN courses.is_active IS 'Whether the course is currently active/available';
