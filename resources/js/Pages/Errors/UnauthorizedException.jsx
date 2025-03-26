import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function UnauthorizedException({auth}) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Unauthorized
                </h2>
            }
        >
            <Head title="UnauthorizedException"/>

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200 text-xl text-center font-bold">
                            Sorry, you are not authorized to this resource!
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
