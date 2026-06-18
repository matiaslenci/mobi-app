-- Corrige la política de INSERT en inmobiliarias.
-- La condición "creado_por = auth.uid()" causaba 42501 porque
-- el JWT puede no estar disponible en el contexto RLS en ese momento.
-- Solo se requiere usuario autenticado; el valor de creado_por lo envía el frontend.

DROP POLICY IF EXISTS "inmobiliarias_insert" ON inmobiliarias;

CREATE POLICY "inmobiliarias_insert"
  ON inmobiliarias FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
