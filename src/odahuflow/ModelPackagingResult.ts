/**
 * API Gateway
 * This is an API Gateway server.
 *
 * OpenAPI spec version: 1.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */

import * as models from './models';

export interface ModelPackagingResult {
    /**
     * Name of a result. It can be docker image, path to s3 artifact and so on
     */
    name?: string;

    /**
     * Specific value
     */
    value?: string;

}
