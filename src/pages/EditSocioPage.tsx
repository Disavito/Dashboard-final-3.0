import { useParams } from 'react-router-dom';
import SocioTitularRegistrationForm from '@/components/custom/SocioTitularRegistrationForm';

function EditSocioPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="min-h-screen bg-background text-text font-sans flex items-center justify-center">
        <p className="text-destructive text-lg">Error: ID de socio no proporcionado para edición.</p>
      </div>
    );
  }

  // El ID es un string (UUID) de la base de datos.
  // No es necesario ni correcto convertirlo a un número.
  // Se pasa directamente al componente del formulario.

  return (
    <div className="min-h-screen bg-background text-text font-sans">
      <header className="relative h-64 md:h-80 lg:h-96 flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary to-secondary shadow-lg">
        <img
          src="https://images.pexels.com/photos/3184433/pexels-photo-3184433.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
          alt="Community building"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative z-10 text-center p-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg leading-tight">
            Editar Titular
          </h1>
          <p className="mt-2 text-lg md:text-xl text-white text-opacity-90 max-w-2xl mx-auto">
            Actualiza la información del socio existente.
          </p>
        </div>
      </header>
      <main className="py-12">
        {/* FIX: Pasamos el 'id' (string) directamente, que es el tipo que espera el componente. */}
        <SocioTitularRegistrationForm socioId={id} onClose={() => {}} onSuccess={() => {}} />
      </main>
    </div>
  );
}

export default EditSocioPage;
