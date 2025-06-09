import React, { Fragment } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useWeb3 } from '../../contexts/Web3Context';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { account, connectWallet, disconnectWallet, isConnected, isConnecting } = useWeb3();
    const navigate = useNavigate();

    const handleWalletAction = async () => {
        if (isConnected) {
            disconnectWallet();
            if (isAuthenticated) logout();
        } else {
            await connectWallet();
        }
    };

    const formatAddress = (address) => {
        if (typeof address !== 'string') return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };



    return (
        <Disclosure as="nav" className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
            {({ open }) => (
                <>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <Link to="/" className="flex items-center">
                                    <div className="flex-shrink-0 flex items-center">
                                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                                            <span className="text-white font-bold text-lg">C</span>
                                        </div>
                                        <span className="ml-2 text-xl font-bold text-gray-900">
                                            CredChain
                                        </span>
                                    </div>
                                </Link>
                            </div>

                            <div className="hidden md:flex items-center space-x-4">
                                {!isAuthenticated ? (
                                    <>
                                        <Link
                                            to="/verify"
                                            className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                                        >
                                            Verify Credential
                                        </Link>
                                        <button
                                            onClick={handleWalletAction}
                                            disabled={isConnecting}
                                            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                                        >
                                            {isConnecting
                                                ? 'Connecting...'
                                                : isConnected && typeof account === 'string'
                                                    ? formatAddress(account)
                                                    : 'Connect Wallet'}

                                        </button>
                                        {isConnected && (
                                            <Link
                                                to="/auth/Login"
                                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                                            >
                                                Login
                                            </Link>
                                        )}
                                    </>
                                ) : (
                                    <Menu as="div" className="relative">
                                        <Menu.Button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500">
                                            <UserCircleIcon className="h-8 w-8 text-gray-400" />
                                            <span className="ml-2 text-gray-700">{formatAddress(account)}</span>
                                        </Menu.Button>
                                        <Transition
                                            as={Fragment}
                                            enter="transition ease-out duration-100"
                                            enterFrom="transform opacity-0 scale-95"
                                            enterTo="transform opacity-100 scale-100"
                                            leave="transition ease-in duration-75"
                                            leaveFrom="transform opacity-100 scale-100"
                                            leaveTo="transform opacity-0 scale-95"
                                        >
                                            <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <Link
                                                            to="/profile"
                                                            className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}
                                                        >
                                                            Profile
                                                        </Link>
                                                    )}
                                                </Menu.Item>
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <button
                                                            onClick={logout}
                                                            className={`${active ? 'bg-gray-100' : ''} block w-full text-left px-4 py-2 text-sm text-gray-700`}
                                                        >
                                                            Sign out
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                            </Menu.Items>
                                        </Transition>
                                    </Menu>
                                )}
                            </div>

                            <div className="md:hidden">
                                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                                    {open ? (
                                        <XMarkIcon className="h-6 w-6" />
                                    ) : (
                                        <Bars3Icon className="h-6 w-6" />
                                    )}
                                </Disclosure.Button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </Disclosure>
    );
};

export default Navbar;