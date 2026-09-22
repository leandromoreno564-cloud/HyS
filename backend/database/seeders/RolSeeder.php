<?php

namespace Database\Seeders;

use App\Models\Rol;
use Illuminate\Database\Seeder;

class RolSeeder extends Seeder
{
    public function run(): void
    {
        Rol::firstOrCreate(['id' => 1], ['nombre' => 'admin', 'descripcion' => 'Administrador del sistema']);
        Rol::firstOrCreate(['id' => 2], ['nombre' => 'inspector', 'descripcion' => 'Inspector matriculado']);
    }
}