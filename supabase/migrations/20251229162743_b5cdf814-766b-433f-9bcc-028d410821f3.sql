-- Add CHECK constraints for name validation in love_results
ALTER TABLE public.love_results 
ADD CONSTRAINT check_name1_length CHECK (length(name1) <= 100),
ADD CONSTRAINT check_name2_length CHECK (length(name2) <= 100),
ADD CONSTRAINT check_message_length CHECK (length(message) <= 500);