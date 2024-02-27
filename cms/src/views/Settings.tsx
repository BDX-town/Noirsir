import React from 'react';

import { TextInput, Button, useTranslations } from '@bdxtown/canaille';

import fr from './Settings.fr-FR.i18n.json';
import { useAppContext } from '../data/AppContext';

const pattern = "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%&]).{12,}$"

export const Settings = () => {
    const form = React.useRef<HTMLFormElement>(null);
    const { T, __ } = useTranslations('Settings', { 'fr-FR': fr });
    const { actions } = useAppContext();
    const { changePassword } = actions;

    const [passwordChanged, setPasswordChanged] = React.useState(false);

    const onSubmit: React.FormEventHandler = React.useCallback(async (e) => {
        e.preventDefault();
        const data = new FormData(e.target as HTMLFormElement);

        const password = data.get("password");
        const passwordConfirm = data.get("password-confirm");

    }, []);

    const checkValidity = React.useCallback((value: unknown) => {
        const data = new FormData(form.current as HTMLFormElement);
        const password = data.get("password");
        const passwordConfirm = value as string;
        console.log(password, passwordConfirm);
        return password !== passwordConfirm ? __('dont-match') : undefined;
    }, [__]);

    return (
        <form ref={form} className='grow flex flex-col' onSubmit={onSubmit}>
            <div className='grow p-4'>
                <div className=''>
                    <h2><T>auth</T></h2>
                    <fieldset className='border-0 flex flex-col gap-4' onChange={() => setPasswordChanged(true)}>
                        <TextInput name="password" minLength={12} pattern={pattern} required={passwordChanged} placeholder="•••••••••••••••" htmlType='password' label={<T>password</T>} />
                        <TextInput name="password-confirm" checkValidity={checkValidity} minLength={12} pattern={pattern} required={passwordChanged} placeholder="•••••••••••••••" htmlType='password' label={<T>password-confirm</T>} />
                    </fieldset>
                </div>

            </div>
            <div className='sticky text-right p-3'>
                <Button htmlType='submit' size={50}><T>apply</T></Button>
            </div>
        </form>
    );
}