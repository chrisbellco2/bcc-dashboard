SELECT first_name, last_name, graduation_year, 
       phase_key, lead_advisor, student_key, created_at
FROM students
WHERE created_at > now() - interval '7 days'
ORDER BY created_at DESC;