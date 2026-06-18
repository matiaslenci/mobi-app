-- Trigger BEFORE INSERT que completa creado_por con auth.uid() si viene NULL.
-- Esto desacopla el frontend del campo de seguridad: el servidor siempre
-- asigna el propietario, independientemente de lo que mande el cliente.
-- El trigger AFTER INSERT crear_membresia_fundador depende de creado_por,
-- por eso este trigger debe ejecutarse ANTES.

CREATE OR REPLACE FUNCTION public.set_creado_por()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.creado_por IS NULL THEN
    NEW.creado_por := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_creado_por ON public.inmobiliarias;

CREATE TRIGGER trg_set_creado_por
  BEFORE INSERT ON public.inmobiliarias
  FOR EACH ROW
  EXECUTE FUNCTION public.set_creado_por();
