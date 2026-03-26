<?php

declare(strict_types=1);

function xconectb_default_subject_profiles_catalog(): array
{
    return [
        [
            'id' => 'xconectb_demo_identity',
            'label' => 'XconectB Demo Identity',
            'profile_family' => 'identity_basic',
            'is_default' => false,
            'data' => [
                'profile_family' => 'identity_basic',
                'name' => 'XconectB Demo User',
                'email' => 'user@xconectb-demo.test',
                'phone' => '+40 733 000 333',
            ],
        ],
        [
            'id' => 'xconectb_demo_business',
            'label' => 'XconectB Demo Business',
            'profile_family' => 'billing_business',
            'is_default' => true,
            'data' => [
                'profile_family' => 'billing_business',
                'company_name' => 'XconectB Demo SRL',
                'company_identification_number' => '87654321',
                'vat_code' => 'RO87654321',
                'company_registration_number' => 'J40/4321/2020',
                'address' => 'Str. Exemplu 20',
                'city' => 'Bucuresti',
                'country' => 'Romania',
                'country_code' => 'RO',
                'email' => 'billing@xconectb-demo.test',
                'phone' => '+40 733 000 111',
                'linked_profiles' => [
                    [
                        'target_profile_id' => 'xconectb_demo_identity',
                        'relation_type' => 'delegate',
                        'label' => 'Primary delegate',
                        'is_primary' => true,
                    ],
                ],
            ],
        ],
        [
            'id' => 'xconectb_demo_individual',
            'label' => 'XconectB Demo Individual',
            'profile_family' => 'billing_individual',
            'is_default' => false,
            'data' => [
                'profile_family' => 'billing_individual',
                'name' => 'XconectB Demo User',
                'address' => 'Str. Exemplu 20',
                'city' => 'Bucuresti',
                'country' => 'Romania',
                'country_code' => 'RO',
                'email' => 'user@xconectb-demo.test',
                'phone' => '+40 733 000 333',
            ],
        ],
    ];
}
