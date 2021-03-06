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

export interface ModelPackagingStatus {
    /**
     * Pod exit code
     */
    exitCode?: number;

    /**
     * Pod last log
     */
    message?: string;

    /**
     * Pod package for name
     */
    podName?: string;

    /**
     * Pod reason
     */
    reason?: string;

    /**
     * List of packaing results
     */
    results?: Array<models.ModelPackagingResult>;

    /**
     * Model Packaging State
     */
    state?: string;

}
