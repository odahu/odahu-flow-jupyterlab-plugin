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

export interface ModelPackaging {
    /**
     * Model packaging id
     */
    id?: string;

    /**
     * Model packaging specification
     */
    spec?: models.ModelPackagingSpec;

    /**
     * Model packaging status
     */
    status?: models.ModelPackagingStatus;

}
