<?php

declare(strict_types=1);

namespace App\Support\Xapps;

final class SubjectProfiles
{
    public static function catalog(): array
    {
        return [
            [
                'id' => 'xconectc_demo_identity',
                'label' => 'XconectC Demo Identity',
                'profile_family' => 'identity_basic',
                'is_default' => false,
                'data' => [
                    'profile_family' => 'identity_basic',
                    'name' => 'XconectC Demo User',
                    'email' => 'user@xconectc-demo.test',
                    'phone' => '+40 733 100 333',
                ],
            ],
            [
                'id' => 'xconectc_demo_business',
                'label' => 'XconectC Demo Business',
                'profile_family' => 'billing_business',
                'is_default' => true,
                'data' => [
                    'profile_family' => 'billing_business',
                    'company_name' => 'XconectC Demo SRL',
                    'company_identification_number' => '99887766',
                    'vat_code' => 'RO99887766',
                    'company_registration_number' => 'J40/9988/2026',
                    'address' => 'Str. Catalogului 11',
                    'city' => 'Bucuresti',
                    'country' => 'Romania',
                    'country_code' => 'RO',
                    'email' => 'billing@xconectc-demo.test',
                    'phone' => '+40 733 100 111',
                    'linked_profiles' => [
                        [
                            'target_profile_id' => 'xconectc_demo_identity',
                            'relation_type' => 'delegate',
                            'label' => 'Primary delegate',
                            'is_primary' => true,
                        ],
                    ],
                ],
            ],
            [
                'id' => 'xconectc_demo_individual',
                'label' => 'XconectC Demo Individual',
                'profile_family' => 'billing_individual',
                'is_default' => false,
                'data' => [
                    'profile_family' => 'billing_individual',
                    'name' => 'XconectC Demo User',
                    'address' => 'Str. Catalogului 11',
                    'city' => 'Bucuresti',
                    'country' => 'Romania',
                    'country_code' => 'RO',
                    'email' => 'user@xconectc-demo.test',
                    'phone' => '+40 733 100 333',
                ],
            ],
        ];
    }
}
