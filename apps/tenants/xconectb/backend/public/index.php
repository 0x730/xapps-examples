<?php

declare(strict_types=1);

use Xapps\BackendKit\BackendKit;

$app = require dirname(__DIR__) . '/bootstrap.php';
BackendKit::dispatch($app, BackendKit::createRequestContext());
