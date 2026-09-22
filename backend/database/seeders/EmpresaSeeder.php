<?php

namespace Database\Seeders;

use App\Models\Empresa;
use App\Models\Usuario;
use Illuminate\Database\Seeder;

class EmpresaSeeder extends Seeder
{
    public function run(): void
    {
        $admin = Usuario::where('email', 'admin@seguridad.local')->first();
        $inspector1 = Usuario::where('email', 'inspector@seguridad.local')->first();
        $inspector2 = Usuario::where('email', 'maria@seguridad.local')->first();

        $empresa1 = Empresa::create([
            'razon_social' => 'Siderúrgica del Plata S.A.',
            'cuit' => '30-71234567-8',
            'direccion' => 'Av. Industrial 4500, Zárate, Buenos Aires',
            'telefono' => '+54 11 4899-1000',
            'email_contacto' => 'contacto@siderurgicadelplata.com.ar',
            'sector' => 'Metalmecánica',
            'cantidad_empleados' => 185,
            'sitio_web' => 'https://siderurgicadelplata.com.ar',
            'persona_contacto' => 'Ing. Roberto Gómez (Jefe de Planta)',
            'creado_por' => $admin->id,
            'activa' => true,
        ]);
        $empresa1->usuarios()->attach([$inspector1->id]);

        $empresa2 = Empresa::create([
            'razon_social' => 'Constructora Horizontes S.R.L.',
            'cuit' => '30-65432198-4',
            'direccion' => 'Ruta Panamericana Km 42, Pilar, Buenos Aires',
            'telefono' => '+54 11 4780-3344',
            'email_contacto' => 'info@horizontesobras.com',
            'sector' => 'Construcción',
            'cantidad_empleados' => 95,
            'sitio_web' => 'https://horizontesobras.com',
            'persona_contacto' => 'Arq. Martín Benítez (Director de Obra)',
            'creado_por' => $inspector1->id,
            'activa' => true,
        ]);
        $empresa2->usuarios()->attach([$inspector1->id, $inspector2->id]);

        $empresa3 = Empresa::create([
            'razon_social' => 'Laboratorios BioQuim S.A.',
            'cuit' => '30-88997766-2',
            'direccion' => 'Parque Industrial Burzaco, Lote 14, Buenos Aires',
            'telefono' => '+54 11 4299-8800',
            'email_contacto' => 'hys@bioquimsa.com',
            'sector' => 'Química y Farmacéutica',
            'cantidad_empleados' => 52,
            'sitio_web' => 'https://bioquimsa.com',
            'persona_contacto' => 'Dra. Silvina Castro (Responsable Calidad)',
            'creado_por' => $admin->id,
            'activa' => true,
        ]);
        $empresa3->usuarios()->attach([$inspector2->id]);

        $empresa4 = Empresa::create([
            'razon_social' => 'Logística y Distribución Austral',
            'cuit' => '30-55443322-1',
            'direccion' => 'Colectora Oeste 1240, Benavídez, Buenos Aires',
            'telefono' => '+54 11 5032-4411',
            'email_contacto' => 'seguridad@logisticaaustral.com',
            'sector' => 'Logística y Transporte',
            'cantidad_empleados' => 140,
            'sitio_web' => 'https://logisticaaustral.com',
            'persona_contacto' => 'Sr. Claudio Suárez (Gerente de Operaciones)',
            'creado_por' => $inspector2->id,
            'activa' => true,
        ]);
        $empresa4->usuarios()->attach([$inspector1->id]);
    }
}