<?php

namespace Database\Seeders;

use App\Models\Usuario;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsuarioSeeder extends Seeder
{
    public function run(): void
    {
        Usuario::create([
            'rol_id' => 1,
            'role' => 'admin',
            'nombre' => 'Ing. Alejandro Morales',
            'email' => 'admin@seguridad.local',
            'password' => Hash::make('password'),
            'telefono' => '+54 11 4455-6677',
            'matricula' => 'MAT-NAC-00192',
            'activo' => true,
        ]);

        Usuario::create([
            'rol_id' => 1,
            'role' => 'admin',
            'nombre' => 'Administrador General',
            'email' => 'admin@hys.com',
            'password' => Hash::make('admin123'),
            'telefono' => '+54 11 4455-6677',
            'matricula' => 'MAT-NAC-00192',
            'activo' => true,
        ]);

        Usuario::create([
            'rol_id' => 2,
            'role' => 'inspector',
            'nombre' => 'Lic. Carlos Rossi',
            'email' => 'inspector@seguridad.local',
            'password' => Hash::make('password'),
            'telefono' => '+54 11 5566-7788',
            'matricula' => 'LIC-HYS-8492',
            'activo' => true,
        ]);

        Usuario::create([
            'rol_id' => 2,
            'role' => 'inspector',
            'nombre' => 'Lic. Inspector Técnico',
            'email' => 'inspector@hys.com',
            'password' => Hash::make('inspector123'),
            'telefono' => '+54 11 5566-7788',
            'matricula' => 'LIC-HYS-8492',
            'activo' => true,
        ]);

        Usuario::create([
            'rol_id' => 2,
            'role' => 'inspector',
            'nombre' => 'Lic. María Fernández',
            'email' => 'maria@seguridad.local',
            'password' => Hash::make('password'),
            'telefono' => '+54 11 6677-8899',
            'matricula' => 'LIC-HYS-3120',
            'activo' => true,
        ]);
    }
}