/**
 * 
 * This will return get function name and parameters out 
 * of the trasnaction input attribute if exists.
 * 
 * @param transaction
 * return: object
 */
export const decodeInputData = (transaction) => {
    if( transaction['input'] !== undefined)
    return {
        function : 'function_name',
        params: ['param1', 'param2' ,'param3']
    }
}