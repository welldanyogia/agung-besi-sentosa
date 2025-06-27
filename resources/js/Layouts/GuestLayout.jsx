import ApplicationLogo from '@/Components/ApplicationLogo';
import {Link} from '@inertiajs/react';

export default function GuestLayout({children}) {
    return (
        <div className="grid grid-cols-2 min-h-screen flex-col items-center bg-gray-100 pt-6 mx-auto sm:justify-center sm:pt-0 max-sm:bg-[url('/bg-login-desktop.png')] max-sm:bg-cover">
            <div
                className={'col-span-1 mx-auto mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg max-sm:col-span-2 max-sm:px-6'}>
                <div className={'text-center font-bold text-xl'}>
                    SIGN IN
                </div>

                <div className="">
                    {children}
                </div>
            </div>
            <div
                className="col-span-1 h-full overflow-hidden bg-[url('/bg-login-desktop.png')] bg-cover bg-center flex items-center justify-center max-sm:hidden">
                <div className=" px-4 py-2 font-bold text-4xl text-white font-sans">
                    CV AGUNG BESI SENTOSA
                </div>
            </div>

        </div>
    );
}
