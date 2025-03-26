<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            'superadmin',
            'admin',
            'employee',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        $superadminRole = Role::create(['name' => 'superadmin']);
        $adminRole = Role::create(['name' => 'admin']);
        $userRole = Role::create(['name' => 'employee']);

        $superadminRole->givePermissionTo(Permission::all());
        $adminRole->givePermissionTo(Permission::all());
        $userRole->givePermissionTo(['employee']);

        $adminUser = User::create([
            'name' => 'Super Admin Name',
            'username' => 'superadmin',
            'email' => 'superadmin@superadmin.com',
            'password' => bcrypt('12341234'),
        ]);
        $adminUser->assignRole('superadmin');

        $adminUser = User::create([
            'name' => 'Admin Name',
            'username' => 'admin',
            'email' => 'admin@admin.com',
            'password' => bcrypt('12341234'),
        ]);
        $adminUser->assignRole('admin');

        $employee = User::create([
            'name' => 'Employee Name',
            'username' => 'employee',
            'email' => 'employee@employee.com',
            'password' => bcrypt('12341234'),
        ]);
        $employee->assignRole('employee');
    }
}
